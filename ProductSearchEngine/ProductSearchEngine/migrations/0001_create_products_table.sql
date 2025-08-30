-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    image_url TEXT NOT NULL,
    average_rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample products data
INSERT INTO products (name, description, category, price, original_price, image_url, average_rating, review_count, stock) VALUES
('Premium Kablosuz Kulaklık', 'Aktif gürültü engelleme özellikli modern kablosuz kulaklık', 'elektronik', 899.00, 1299.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.2, 127, 15),
('Premium Pamuk T-Shirt', 'Modern baskılı, yüksek kaliteli pamuklu t-shirt', 'giyim', 129.00, NULL, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.8, 89, 25),
('Gaming Laptop Pro', 'Profesyonel çalışma için modern laptop bilgisayar', 'elektronik', 15999.00, 18999.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.5, 234, 2),
('Konforlu Okuma Koltuğu', 'Ev konforu için rahat okuma koltuğu', 'ev-dekorasyon', 2499.00, NULL, 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.9, 67, 8),
('DSLR Fotoğraf Makinesi', 'Fotoğraf meraklıları için profesyonel kamera', 'elektronik', 8999.00, 10999.00, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.3, 156, 12),
('Profesyonel Koşu Ayakkabısı', 'Atletik aktiviteler için şık koşu ayakkabısı', 'spor', 599.00, 799.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.7, 302, 18),
('Web Geliştirme Rehberi', 'Öğrenme ve gelişim için eğitici kitap', 'kitap', 89.00, NULL, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.1, 78, 30),
('Otomatik Kahve Makinesi', 'Sabah rutinleri için kahve makinesi', 'ev-dekorasyon', 1299.00, 1599.00, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.6, 145, 0),
('Wireless Mouse', 'Ergonomik tasarımlı kablosuz mouse', 'elektronik', 199.00, 299.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.4, 92, 35),
('Yoga Matı', 'Premium kalitede yoga ve egzersiz matı', 'spor', 149.00, NULL, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.6, 128, 22),
('Dekoratif Vazo', 'Ev dekorasyonu için şık seramik vazo', 'ev-dekorasyon', 299.00, NULL, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.3, 45, 14),
('Bluetooth Hoparlör', 'Taşınabilir kablosuz bluetooth hoparlör', 'elektronik', 399.00, 599.00, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.5, 187, 28),
('Denim Ceket', 'Klasik kesim denim ceket', 'giyim', 349.00, NULL, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.2, 73, 19),
('Masa Lambası', 'Modern tasarımlı çalışma masa lambası', 'ev-dekorasyon', 179.00, 249.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.7, 94, 33),
('Spor Çantası', 'Dayanıklı spor ve seyahat çantası', 'spor', 249.00, NULL, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.4, 156, 41),
('Programlama Kitabı', 'JavaScript ve React geliştirme rehberi', 'kitap', 159.00, NULL, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.8, 203, 27),
('Wireless Klavye', 'Mekanik hisli kablosuz klavye', 'elektronik', 449.00, 549.00, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.3, 118, 16),
('Yastık Seti', 'Dekoratif ev tekstili yastık takımı', 'ev-dekorasyon', 199.00, 299.00, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.5, 82, 24),
('Koşu Kıyafeti', 'Nefes alabilen spor giyim seti', 'giyim', 279.00, NULL, 'https://images.unsplash.com/photo-1506629905607-45c9e5e2e9b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.6, 134, 31),
('Tablet Stand', 'Ayarlanabilir tablet ve telefon standı', 'elektronik', 89.00, 129.00, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 4.1, 67, 45);
