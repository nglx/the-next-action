class CreateActions < ActiveRecord::Migration
  def self.up
    create_table(:actions) do |t|
      t.integer   :user_id
      t.string    :title
      t.string    :context
      t.string    :description
      t.string    :project
      t.integer   :project_pos
      t.integer   :context_pos
      t.timestamp :due_date
      t.timestamp :complete_date

      t.timestamp    :created_at
      t.timestamp    :updated_at
      t.boolean :active
      t.integer :version
      t.integer :id_start
      t.string :id_start_db
      t.timestamp    :synced_at
    end
  end

  def self.down
    drop_table :actions
  end
end


# DELETED hosted only on ServerSide // CLIENT SIDE - to be deleted
# CHANGED                           // CLIENT SIDE - to be synchronized
# SYNCHRONIZED                      // CLIENT SIDE - retrived from SS


# CS
# ==
# DELETED
# TO_BE_SYNCHRONIZED (changed on client side)
# SYNCHRONIZED

# SS
# ==
# DELETED -1 as version
# NORMAL  1..infinity as version