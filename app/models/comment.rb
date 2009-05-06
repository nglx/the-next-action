class Comment
  include Validatable
  
  attr_accessor :from, :subject, :comment
  
  validates_format_of :from, :with => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, :message => 'Not a correct email'

  validates_presence_of :subject
  validates_presence_of :comment

  def initialize(attributes = {})
    attributes.each { |att, value| 
      self.send("#{att}=", value) if self.respond_to? "#{att}="
    }  
  end
end