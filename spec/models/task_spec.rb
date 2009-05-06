require File.dirname(__FILE__) + '/../spec_helper'

describe Task do
  fixtures :contexts, :projects, :tasks, :users
  before(:each) do
    @tasks = Task.find(:all)
  end
  
  it "should have some tasks" do
    @tasks.should_not be_empty
  end

  it "should see the context" do
    @tasks.first.context.should_not be_nil
  end

  it "should see the project" do
    @tasks.first.project.should_not be_nil
  end

  it "should belong to user" do
    @tasks.first.user.should_not be_nil
  end
end
