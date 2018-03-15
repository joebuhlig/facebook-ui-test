import Composer from 'discourse/models/composer';

export default Ember.Component.extend({
  actions: { 
    createNewTopic() {
      if (this.currentUser && this.currentUser.can_create_topic) {
        this.container.lookup('controller:composer').open({action: Composer.CREATE_TOPIC, draftKey: Composer.CREATE_TOPIC});
      }
    }
  }
});