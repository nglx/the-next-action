require File.dirname(__FILE__) + '/../spec_helper'

describe Context do
  fixtures :contexts, :tasks

  before(:each) do
    @context = Context.find(:all)
  end

  it "should have non empty collection of contexts" do
    @context.should_not be_empty
  end

  it "should have some tasks" do
    @context.first.tasks.should_not be_empty
  end

  it "should belong to some user" do
    @context.first.user.should_not be_nil
  end

end
