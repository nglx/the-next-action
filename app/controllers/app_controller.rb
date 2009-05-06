class AppController < ApplicationController
  def index
    render :action => 'index', :layout => false
  end
end
