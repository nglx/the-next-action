class UserMailer < ActionMailer::Base
  def comment(comment)
    @recipients = "info@thewayout.eu"
    @from = comment.from
    @subject = comment.subject
    @body[:text] = comment.comment 
  end
  
  def signup_notification(user)
    setup_email(user)
    @subject    += 'Please activate your new account'
  
    @body[:url]  = "http://#{HOST_URL}/activate/#{user.activation_code}"
  end
  
  def activation(user)
    setup_email(user)
    @subject    += 'Your account has been activated!'
    @body[:url]  = "http://#{HOST_URL}/"
  end
  
  def forgot_password(user)
    setup_email(user)
    @subject += 'You have requested to change your password'
    @body[:url] = "http://#{HOST_URL}/reset_password/#{user.password_reset_code}"
  end
  
  def reset_password(user)
    setup_email(user)
    @subject += 'Your password has been reset.'
  end
  
  protected
    def setup_email(user)
      @recipients  = "#{user.email}"
      @from        = "ADMINEMAIL"
      @subject     = "[The Next Action] "
      @sent_on     = Time.now
      @body[:user] = user
    end
end
