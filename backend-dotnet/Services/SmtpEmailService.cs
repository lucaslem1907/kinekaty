using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace KinekatyApi.Services;

public class SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger) : IEmailService
{
    public async Task SendWelcomeEmailAsync(string toEmail, string toName)
    {
        var host     = config["Smtp:Host"];
        var port     = int.Parse(config["Smtp:Port"] ?? "587");
        var user     = config["Smtp:User"];
        var pass     = config["Smtp:Pass"];
        var fromName = config["Smtp:FromName"] ?? "Kinekaty";

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(pass))
        {
            logger.LogWarning("SMTP not configured — skipping welcome email for {Email}", toEmail);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, user));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = $"Welkom bij {fromName}!";

        message.Body = new TextPart("html")
        {
            Text = $"""
                    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f7fafc;border-radius:12px;">
                      <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:10px;padding:28px 24px;text-align:center;margin-bottom:24px;">
                        <h1 style="color:#fff;margin:0;font-size:26px;">Welkom bij {fromName}!</h1>
                      </div>
                      <p style="font-size:15px;color:#2d3748;">Hallo <strong>{toName}</strong>,</p>
                      <p style="font-size:15px;color:#4a5568;line-height:1.6;">
                        Je account is succesvol aangemaakt. Je kan nu inloggen en lessen boeken.
                      </p>
                      <p style="font-size:13px;color:#718096;margin-top:32px;">
                        Heb je vragen? Stuur ons gerust een berichtje.
                      </p>
                      <p style="font-size:13px;color:#a0aec0;margin-top:8px;">
                        &mdash; Het {fromName} team
                      </p>
                    </div>
                    """
        };

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(user, pass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            logger.LogInformation("Welcome email sent to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send welcome email to {Email}", toEmail);
        }
    }
}
