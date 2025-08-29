// Email servis sınıfı - Gerçek projede SendGrid, AWS SES, NodeMailer vs. kullanılabilir
// Şimdilik console'a log yazacak, daha sonra gerçek email servisi entegre edilebilir

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private fromEmail = process.env.FROM_EMAIL || "noreply@yourcompany.com";
  
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Şimdilik console'a yazdır - gerçek projede email provider kullanılacak
      console.log("📧 EMAIL GÖNDERİMİ:");
      console.log("To:", data.to);
      console.log("Subject:", data.subject);
      console.log("From:", data.from || this.fromEmail);
      console.log("Content:", data.html);
      console.log("---");
      
      // TODO: Gerçek email servisi entegrasyonu
      // Örnek: SendGrid, AWS SES, NodeMailer, vs.
      /*
      if (process.env.NODE_ENV === 'production') {
        // Gerçek email gönderimi burada yapılacak
        const result = await emailProvider.send({
          to: data.to,
          subject: data.subject,
          html: data.html,
          from: data.from || this.fromEmail
        });
        return result.success;
      }
      */
      
      // Development ortamında her zaman başarılı dönsün
      return true;
      
    } catch (error) {
      console.error("Email gönderim hatası:", error);
      return false;
    }
  }
  
  // Toplu email gönderimi
  async sendBulkEmail(emails: EmailData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;
    
    for (const email of emails) {
      const result = await this.sendEmail(email);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }
    
    return { success, failed };
  }
  
  // Email template'leri
  getOrderPlacedTemplate(productName: string, quantity: number, buyerName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .highlight { background-color: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 Yeni Sipariş Aldınız!</h2>
          </div>
          <div class="content">
            <p>Merhaba,</p>
            <p><strong>${buyerName}</strong> müşterinizden yeni bir sipariş aldınız:</p>
            <div class="highlight">
              <ul>
                <li><strong>Ürün:</strong> ${productName}</li>
                <li><strong>Miktar:</strong> ${quantity} adet</li>
                <li><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</li>
              </ul>
            </div>
            <p>Siparişi onaylamak veya reddetmek için lütfen panelinize giriş yapın.</p>
          </div>
          <div class="footer">
            <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  getOrderStatusTemplate(productName: string, quantity: number, status: string): string {
    const statusMessages = {
      'APPROVED': { title: '✅ Siparişiniz Onaylandı!', message: 'Siparişiniz onaylandı ve hazırlanmaya başlandı.' },
      'REJECTED': { title: '❌ Siparişiniz Reddedildi', message: 'Maalesef siparişiniz reddedildi.' },
      'SHIPPED': { title: '🚚 Siparişiniz Kargoya Verildi!', message: 'Siparişiniz kargoya verildi ve size ulaşmak üzere.' },
      'DELIVERED': { title: '📦 Siparişiniz Teslim Edildi!', message: 'Siparişiniz başarıyla teslim edildi.' }
    };
    
    const statusInfo = statusMessages[status as keyof typeof statusMessages] || statusMessages.APPROVED;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .highlight { background-color: #d1ecf1; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${statusInfo.title}</h2>
          </div>
          <div class="content">
            <p>Merhaba,</p>
            <p>${statusInfo.message}</p>
            <div class="highlight">
              <ul>
                <li><strong>Ürün:</strong> ${productName}</li>
                <li><strong>Miktar:</strong> ${quantity} adet</li>
                <li><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</li>
              </ul>
            </div>
            <p>Siparişlerinizi takip etmek için panelinize giriş yapabilirsiniz.</p>
          </div>
          <div class="footer">
            <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();