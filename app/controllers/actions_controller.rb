class ActionsController < ApplicationController
  include AuthenticatedSystem

  
  # what about version
  def sync
    if current_user
      start = Time.now
      data = ActiveSupport::JSON.decode(params[:data])
      
      data.each{ |action|
        action['user_id'] = current_user.id
        action.delete 'created_at' # never update created_at
        a = Action.find_existing(action)
#        if a.version <= action.version
          a.update_attributes(action)
          a.version += 1
          a.synced_at = start
          a.save
#        else
#          # server side version is higher - donot change it but override local
#          to_update_on_client_side[a.id] = a
#        end
      }
      sync_at = Time.zone.at(params[:sync_at].to_i)
      data = nil
      # TODO think about that > maybe >=  but check id_start_db
      if sync_at
        data = Action.find(:all, :conditions => [ "user_id = :user_id AND synced_at > :sync_at", {:user_id => current_user.id, :sync_at => sync_at} ])
      else  
        data = Action.find_all_by_user_id(current_user.id)
      end
#      data.each{ |a|
#          to_update_on_client_side[a.id] = a
#      }
      
      render :json => { :success => true, :sync_at => (start.to_i), :user_id => (current_user.id), :data => data }.to_json
    else      
      render :json => { :success => false }.to_json
    end
  end
end
