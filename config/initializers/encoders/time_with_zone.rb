module ActiveSupport
  class TimeWithZone
    def to_json(options = nil)
      %("#{time.strftime("%Y-%m-%d %H:%M:%S")}")
    end
  end
end