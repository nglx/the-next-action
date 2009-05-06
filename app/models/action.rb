class Action < ActiveRecord::Base
  belongs_to :user

  def self.find_existing action
    if action['id'] < 0
      a = Action.find(:first,  :conditions => { :user_id => action['user_id'], :id_start => action['id_start'], :id_start_db => action['id_start_db'] })
      a = Action.new(action) unless a
      a
    else
      Action.find(:first,  :conditions => { :user_id => action['user_id'], :id => action['id'] })
      # what to do if positive id cannot be found?
    end    
  end
end
