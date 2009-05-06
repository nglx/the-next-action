require File.dirname(__FILE__) + '/../spec_helper'

describe RegisterController, "on login check" do
  it "should return ok when login is not in the system" do
    User.stub!(:is_registered?).and_return(false)    
    post 'login_is_used', {:login => 'newone'}
	response.should have_text('{used: false}')
  end

  it "should return error when login is used" do
    User.stub!(:is_registered?).and_return(true)    
    post 'login_is_used', {:login => 'existing'}
    response.should have_text('{used: true}')
  end
end

describe RegisterController, "on creation" do
  before(:each) do
    @user = mock("user")
    User.stub!(:new).and_return(@user)    
  end

  it "should pass when user-passed data is ok" do
	@user.stub!(:save).and_return(true)
	post 'create', {:user => {:firstname => 'Aslak'}}
    response.should have_text("ok".to_json)
  end
  
  it "should wrap an error coming from model" do
    error = {:error => "error description"}
	@user.stub!(:save).and_return(false)
    @user.should_receive(:errors).and_return(error)
	
	post 'create', {:user => {:firstname => 'Aslak'}}
	response.should have_text(error.to_json)
  end

end