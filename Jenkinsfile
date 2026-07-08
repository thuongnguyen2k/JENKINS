pipeline {
    agent none 
    
    environment {
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        REGISTRY = "thuongnguyen2kvp" // CHÚ Ý: Phải là Docker Hub Username, không được dùng Email
    }

    stages {
        stage('Parallel Test, Build & Push') {
            parallel {
                stage('Frontend (React)') {
                    agent { label 'frontend' }
                    steps {
                        dir('frontend') {
                            echo "=== Bắt đầu Build & Test Frontend ==="
                            sh 'npm install'
                            sh 'npm run test'
                            sh 'npm run build'
                            
                            echo "=== Build & Push Docker Image Frontend ==="
                             sh 'docker build -t ${REGISTRY}/shop-frontend:${IMAGE_TAG} .'
                             withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_CREDS_PSW', usernameVariable: 'DOCKER_CREDS_USR')]) {
                                 sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'
                                 sh 'docker push ${REGISTRY}/shop-frontend:${IMAGE_TAG}'
                             }
                        }
                    }
                }

                stage('Backend (Java/Maven)') {
                    agent { label 'backend' }
                    environment {
                        JAVA_HOME = '/usr/lib/jvm/java-21-openjdk'
                    }
                    steps {
                        dir('backend') {
                            echo "=== Bắt đầu Test & Build Backend ==="
                            sh 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk && mvn clean test'
                            sh 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk && mvn clean package -DskipTests'
                            
                            echo "=== Build & Push Docker Image Backend ==="
                             sh 'docker build -t ${REGISTRY}/shop-backend:${IMAGE_TAG} .'
                             withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_CREDS_PSW', usernameVariable: 'DOCKER_CREDS_USR')]) {
                                 sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'
                                 sh 'docker push ${REGISTRY}/shop-backend:${IMAGE_TAG}'
                             }
                        }
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                expression { env.BRANCH_NAME == 'develop' || env.GIT_BRANCH == 'origin/develop' || env.GIT_BRANCH == 'develop' }
            }
            agent { label 'frontend' }
            steps {
                echo "=== Deploy E-Commerce to STAGING ==="
                 withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                     sh '''
                         cd k8s/overlays/staging
                         kustomize edit set image \
                             thuongnguyen2kvp/shop-frontend=${REGISTRY}/shop-frontend:${IMAGE_TAG} \
                             thuongnguyen2kvp/shop-backend=${REGISTRY}/shop-backend:${IMAGE_TAG}
                         kubectl apply -k .
                         kubectl rollout status deployment/frontend -n shop-staging --timeout=120s
                         kubectl rollout status deployment/backend -n shop-staging --timeout=120s
                     '''
                 }
                echo "Deploy Staging thành công!"
            }
        }

        stage('Verify Staging') {
            when {
                expression { env.BRANCH_NAME == 'develop' || env.GIT_BRANCH == 'origin/develop' || env.GIT_BRANCH == 'develop' }
            }
            agent { label 'frontend' }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        echo "=== Pod Status ==="
                        kubectl get pods -n shop-staging -o wide
                        echo "=== Service Status ==="
                        kubectl get svc -n shop-staging
                        echo "=== Health Check ==="
                        kubectl wait --for=condition=Ready pod -l app=backend \
                            -n shop-staging --timeout=60s
                    '''
                }
            }
        }

        stage('Approval Gate for Production') {
            when {
                expression { env.BRANCH_NAME == 'main' || env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' }
            }
            agent { label 'frontend' }
            steps {
                input message: 'Sếp có đồng ý triển khai lên Production không?', ok: 'Deploy ngay!'
            }
        }

        stage('Deploy to Production') {
            when {
                expression { env.BRANCH_NAME == 'main' || env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' }
            }
            agent { label 'frontend' }
            steps {
                echo "=== Deploy E-Commerce to PRODUCTION ==="
                 withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                     sh '''
                         cd k8s/overlays/production
                         kustomize edit set image \
                             thuongnguyen2kvp/shop-frontend=${REGISTRY}/shop-frontend:${IMAGE_TAG} \
                             thuongnguyen2kvp/shop-backend=${REGISTRY}/shop-backend:${IMAGE_TAG}
                         kubectl apply -k .
                         kubectl rollout status deployment/frontend -n shop-production --timeout=120s
                         kubectl rollout status deployment/backend -n shop-production --timeout=120s
                     '''
                 }
                echo "Deploy Production thành công!"
            }
        }
    }
}
