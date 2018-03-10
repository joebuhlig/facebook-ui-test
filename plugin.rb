# name: discourse-facebook-ui 
# about: Gives Discourse a native Facebook feel.
# version: 0.1
# author: Joe Buhlig joebuhlig.com
# url: https://github.com/adleaksofficial/discourse-facebook-ui

enabled_site_setting :facebook_ui_enabled

register_asset 'stylesheets/facebook-ui.scss'

after_initialize do
  require 'topic_list_item_serializer'
  class ::TopicListItemSerializer
    attributes :fb_excerpt

    def fb_excerpt
      if object.previewed_post
        doc = Nokogiri::HTML::fragment(object.previewed_post.cooked)
        doc.to_html
      else
        object.excerpt
      end
    end
  end

end