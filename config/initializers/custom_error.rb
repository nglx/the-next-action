# http://www.noobkit.com/show/ruby/rails/rails-stable/actionpack/actionview/helpers/activerecordhelper/error_message_on.html

ActionView::Base.field_error_proc = Proc.new do |html_tag, instance|
  msg = instance.error_message
  error_style = "background-color: #f2afaf"
  if html_tag =~ /<(input|textarea|select)[^>]+style=/
    style_attribute = html_tag =~ /style=['"]/
    html_tag.insert(style_attribute + 7, "#{error_style}; ")
  elsif html_tag =~ /<(input|textarea|select)/
    first_whitespace = html_tag =~ /\s/
    html_tag[first_whitespace] = " style='#{error_style}' "
  end
  html_tag
end
