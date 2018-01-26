const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const processMessage = require('../../src/hooks/process-message');

describe('\'process-message\' hook', () => {
  let app;
  
  beforeEach(() => {
    // Create a new plain Feathers application
    app = feathers();

    // Register a dummy custom service that just return the
    // message data back
    app.use('/messages', {
      async create(data) {
        return data;
      }
    });

    // Register the `processMessage` hook on that service
    app.service('messages').hooks({
      before: {
        create: processMessage()
      }
    });
  });

  it('processes the message as expected', async () => {
    // A user stub with just an `_id`
    const user = { _id: 'test' };
    // The service method call `params`
    const params = { user };

    // Create a new message with params that contains our user
    const message = await app.service('messages').create({
      text: 'Hi there',
      additional: 'shoudl be removed'
    }, params);

    assert.equal(message.text, 'Hi there');
    // `userId` was set
    assert.equal(message.userId, 'test');
    // `additional` property has been removed
    assert.ok(!message.additional);
  });
});
