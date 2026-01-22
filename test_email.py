import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_test_email():
    # Email configuration
    smtp_server = "smtp.office365.com"
    smtp_port = 587
    sender_email = "developer@alrawabigroup.com"
    sender_password = "Qatar@9863"
    
    # Recipients
    recipients = ["minhaj.rawabi@gmail.com", "rawabihelpdesk@gmail.com", "developer@alrawabigroup.com"]
    
    try:
        # Create message
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = ", ".join(recipients)
        message["Subject"] = "Deep Test: Email System Connectivity Test"
        
        body = """
        This is a deep test email to verify the SMTP connectivity for AL RAWABI FOOD STUFF website.
        
        Sender: developer@alrawabigroup.com
        Status: Testing...
        
        If you receive this, the email system is working correctly.
        """
        message.attach(MIMEText(body, "plain"))
        
        # Connect to server and send
        print(f"Connecting to {smtp_server}:{smtp_port}...")
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.set_debuglevel(1)  # Enable debug output to see the conversation
        server.starttls() # Secure the connection
        
        print("Logging in...")
        server.login(sender_email, sender_password)
        
        print(f"Sending email to {', '.join(recipients)}...")
        server.sendmail(sender_email, recipients, message.as_string())
        
        server.quit()
        print("\nSUCCESS: Email sent successfully!")
        return True
        
    except Exception as e:
        print(f"\nFAILURE: Could not send email.")
        print(f"Error details: {str(e)}")
        return False

if __name__ == "__main__":
    send_test_email()
