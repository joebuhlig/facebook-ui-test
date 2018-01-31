import { withPluginApi } from 'discourse/lib/plugin-api';
import { findRawTemplate } from 'discourse/lib/raw-templates';
import { default as computed, on, observes } from 'ember-addons/ember-computed-decorators';
import TopicModel from 'discourse/models/topic';
import TopicController from 'discourse/controllers/topic';
import Composer from 'discourse/models/composer';
import UserStream from 'discourse/models/user-stream'
import { emojiUnescape } from 'discourse/lib/text';

export default {
  name: 'facebook-ui',
  initialize(container){

    if (!Discourse.SiteSettings.topic_list_previews_enabled) return;

    withPluginApi('0.8.12', (api) => {
      api.modifyClass('component:topic-list-item', {

        @on('didInsertElement')
        _setupListDOM() {
          api.container.lookup('controller:topic').set('openComposer', false);
          $('.write-comment-link').unbind().click(function(){
            api.container.lookup('controller:topic').set('openComposer', true);
          })
        },

        @on('init')
        _setupList() {
          const topic = this.get('topic');
          const url = topic.linked_post_number ?
            topic.urlForPostNumber(topic.linked_post_number) :
            topic.get('lastUnreadUrl');
          var repliesText = I18n.t('replies_lowercase', { count: topic.get('replyCount') });
          var likesText = I18n.t('likes_lowercase', { count: topic.like_count });
          topic.set('repliesText', repliesText);
          topic.set('likesText', likesText);
          topic.set('topicUrl', url);
        },

        buildBuffer(buffer) {
          const template = findRawTemplate('list/facebook-list-item');
          if (template) {
            buffer.push(template(this));
          }
        }

      })

      TopicController.reopen({
        initTopic: function() {
          if (this.get('openComposer')) {
            this.send('replyToPost');
          }
        }.observes("model.postStream.loaded")
      })

      TopicModel.reopen({
        @computed('fb_excerpt')
        escapedExcerpt(excerpt) {
          return emojiUnescape(excerpt);
        },
        hasExcerpt: Em.computed.notEmpty('fb_excerpt'),

        excerptTruncated: function() {
          const e = this.get('fb_excerpt');
          return( e && e.substr(e.length - 8,8) === '&hellip;' );
        }.property('fb_excerpt')
      })

      api.registerConnectorClass('discovery-below', 'top-user-list', {
        setupComponent(args, component) {
          const users = api.container.lookup('service:store').find("directoryItem", {"period": "weekly", "order": "likes_received"});
          users.then(function(result){
            component.set('topUsers', result.content);
          })
        }
      })
    })
  }
}