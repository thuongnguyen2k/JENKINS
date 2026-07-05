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
                            echo "=== Bắt đầu Build Frontend ==="
                            sh 'npm install'
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

        stage('Deploy') {
            agent { label 'frontend' }
            steps {
                echo "=== Deploy E-Commerce ==="
                 sh '''
                    export IMAGE_TAG=${IMAGE_TAG}
                    export REGISTRY=${REGISTRY}
                    docker compose pull
                    docker compose down
                    docker compose up -d
                 '''
                echo "Deploy thành công!"
            }
        }
    }
}
