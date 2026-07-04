package com.shop;

import com.shop.models.Product;
import com.shop.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            System.out.println("Seeding demo products...");
            
            Product p1 = new Product("Sony WH-1000XM5", "Tai nghe chống ồn không dây đỉnh cao, âm thanh Hires.", new BigDecimal("8500000"), "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800");
            Product p2 = new Product("MacBook Pro 14 M3", "Laptop Apple cấu hình siêu mạnh dành cho Creator.", new BigDecimal("49990000"), "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800");
            Product p3 = new Product("Bàn phím cơ Keychron Q1", "Bàn phím cơ Custom nhôm nguyên khối, gõ cực êm.", new BigDecimal("4200000"), "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800");
            Product p4 = new Product("Chuột Logitech MX Master 3S", "Chuột không dây chuyên nghiệp cho dân code, siêu êm.", new BigDecimal("2500000"), "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800");
            Product p5 = new Product("Màn hình Dell UltraSharp 27", "Độ phân giải 4K, chuẩn màu 99% sRGB cho Designer.", new BigDecimal("12000000"), "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800");
            Product p6 = new Product("Máy pha cà phê Nespresso", "Bắt đầu ngày mới với một tách Espresso thơm lừng.", new BigDecimal("3500000"), "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800");

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6));
            
            System.out.println("Seeded " + productRepository.count() + " products.");
        }
    }
}
