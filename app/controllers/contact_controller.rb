class ContactController < ApplicationController
  def send_comment
    @comment = Comment.new(params[:comment])
    if @comment.valid?
      UserMailer.deliver_comment(@comment)
      flash[:notice] = "Comment was sent. Thank you."
      render :template => 'app/info'
    else  
      render :action => 'index'
    end
  end
end
