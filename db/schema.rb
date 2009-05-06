# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20081007144048) do

  create_table "actions", :force => true do |t|
    t.integer  "user_id"
    t.string   "title"
    t.string   "context"
    t.string   "description"
    t.string   "project"
    t.integer  "project_pos"
    t.integer  "context_pos"
    t.datetime "due_date"
    t.datetime "complete_date"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active"
    t.integer  "version"
    t.integer  "id_start"
    t.string   "id_start_db"
    t.datetime "synced_at"
  end

  create_table "users", :force => true do |t|
    t.string   "login",                     :limit => 40
    t.string   "firstname",                 :limit => 100
    t.string   "lastname",                  :limit => 100
    t.string   "email",                     :limit => 100
    t.string   "crypted_password",          :limit => 40
    t.string   "salt",                      :limit => 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            :limit => 40
    t.datetime "remember_token_expires_at"
    t.string   "activation_code",           :limit => 40
    t.datetime "activated_at"
    t.string   "state",                                    :default => "passive"
    t.datetime "deleted_at"
    t.boolean  "newsletter",                               :default => false
    t.string   "password_reset_code",       :limit => 40
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

end
