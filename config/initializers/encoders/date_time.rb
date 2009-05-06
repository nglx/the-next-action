class DateTime
  def to_json(options = nil)
    strftime('"%Y/%m/%d %H:%M:%S"')
  end
end
