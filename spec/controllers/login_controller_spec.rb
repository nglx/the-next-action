require File.dirname(__FILE__) + '/../spec_helper'

describe LoginController do
  before(:each) do
	@user = mock("user")
	User.stub!(:new).and_return(@user)    
    session[:user] = nil
  end
	
  it "should return ok on proper login" do
    @user.stub!(:authorize).and_return(true)
	post 'login', {:user => {:login=>'test',:password=>'test'}}  
    response.should have_text('{login: true}')
  end
  
  it "should return error on wrong credentials" do
    @user.stub!(:authorize).and_return(false)
    post 'login', {:user => {:login=>'test',:password=>'test1'}}  
    response.should have_text('{login: false}')
  end
  
  it "should store the session on proper login" do
    @user.stub!(:authorize).and_return(true)
    post 'login', {:user => {:login=>'test',:password=>'test'}}  
    session[:user].should_not be_nil
  end
  
  it "should not create session on wrong login" do
    @user.stub!(:authorize).and_return(false)
    post 'login', {:user => {:login=>'test',:password=>'test'}}  
    session[:user].should be_nil
  end
  
  it "should clean the session on logout" do
    session[:user] = "something"
	post 'logout'
	session[:user].should be_nil
  end
end
