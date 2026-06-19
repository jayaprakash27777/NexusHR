package com.nexushr.chat.websocket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class RedisConfig {

    public static final String CHAT_TOPIC = "chat:pubsub:topic";
    public static final String PRESENCE_TOPIC = "chat:pubsub:presence";
    public static final String TYPING_TOPIC = "chat:pubsub:typing";
    public static final String RECEIPT_TOPIC = "chat:pubsub:receipt";

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter messageListenerAdapter) {

        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(messageListenerAdapter, new ChannelTopic(CHAT_TOPIC));
        container.addMessageListener(messageListenerAdapter, new ChannelTopic(PRESENCE_TOPIC));
        container.addMessageListener(messageListenerAdapter, new ChannelTopic(TYPING_TOPIC));
        container.addMessageListener(messageListenerAdapter, new ChannelTopic(RECEIPT_TOPIC));
        return container;
    }

    @Bean
    public MessageListenerAdapter messageListenerAdapter(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "onMessage");
    }
}
