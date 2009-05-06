require File.dirname(__FILE__) + '/../spec_helper'

describe Project do
  fixtures :projects, :tasks

  before(:each) do
    @project = Project.find(:all)
  end

  it "should have non empty collection of projects" do
    @project.should_not be_empty
  end

  it "should have some tasks" do
    @project.first.tasks.should_not be_empty
  end

  it "should belong to some user" do
    @project.first.user.should_not be_nil
  end

end
