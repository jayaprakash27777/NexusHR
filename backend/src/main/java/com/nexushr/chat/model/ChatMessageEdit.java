package com.nexushr.chat.model;

import com.nexushr.chat.model.converter.MessageAttributeConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_message_edits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageEdit {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;

    @Convert(converter = MessageAttributeConverter.class)
    @Column(name = "old_content", columnDefinition = "TEXT")
    private String oldContent;

    @Convert(converter = MessageAttributeConverter.class)
    @Column(name = "new_content", columnDefinition = "TEXT")
    private String newContent;

    @Column(name = "edited_at", nullable = false)
    @Builder.Default
    private LocalDateTime editedAt = LocalDateTime.now();
}
