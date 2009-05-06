# This controller handles the login/logout function of the site.  
class SessionsController < ApplicationController
  # Be sure to include AuthenticationSystem in Application Controller instead
  include AuthenticatedSystem

  def create
    logout_keeping_session!
    user = User.authenticate(params[:login], params[:password])
    if user
      # Protects against session fixation attacks, causes request forgery
      # protection if user resubmits an earlier form using back
      # button. Uncomment if you understand the tradeoffs.
      # reset_session
      self.current_user = user
      new_cookie_flag = (params[:remember_me] == "1")
      handle_remember_cookie! new_cookie_flag
      render :json => { :success => true }.to_json #user.to_ext_json(:success => true)
    else
      @login       = params[:login]
      @remember_me = params[:remember_me]
      render :json => { :success => false, :errors => [ {:msg => "Wrong username of password", :id => "login" }] }.to_json# , :status=> :unauthorized
    end
  end

  def check
    if current_user
      render :json => { :success => true, :login => current_user.login, :id => current_user.id }.to_json
    else
      render :json => { :success => false }.to_json #, :status=> :unauthorized
    end
  end
  
  def destroy
    logout_killing_session!
    render :json => "{\"success\" : true}"
  end
end
