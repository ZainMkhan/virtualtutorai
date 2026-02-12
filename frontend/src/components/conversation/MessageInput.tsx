import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Mic, Send, Loader } from 'lucide-react';
import FileUploadSection from './FileUploadSection';
import type { UploadedFile } from '@/components/shared/FileUpload';

interface MessageInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSending: boolean;
  attachedFile: UploadedFile | null;
  showFileUpload: boolean;
  onFileSelect: (file: UploadedFile) => void;
  onToggleFileUpload: (show: boolean) => void;
  onRemoveFile: () => void;
  isListening: boolean;
  isSpeechSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  interimTranscript: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  onInputChange,
  onSubmit,
  isSending,
  attachedFile,
  showFileUpload,
  onFileSelect,
  onToggleFileUpload,
  onRemoveFile,
  isListening,
  isSpeechSupported,
  onStartListening,
  onStopListening,
  interimTranscript,
  disabled = false,
}) => {
  const { t } = useTranslation();
  return (
    <div className="fixed bottom-6 right-0 left-64 flex justify-center px-6">
      <div className="w-full max-w-2xl">
        <FileUploadSection
          showFileUpload={showFileUpload}
          attachedFile={attachedFile}
          onFileSelect={onFileSelect}
          onToggle={onToggleFileUpload}
          onRemove={onRemoveFile}
        />

        <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-lg px-6 py-4 border border-gray-100">
          <div className="flex gap-3 items-center">
            <Input
              type="text"
              placeholder={t('conversation.ask_me_anything')}
              value={inputValue + (isListening ? interimTranscript : '')}
              onChange={(e) => onInputChange(e.target.value)}
              disabled={disabled || isSending}
              className="flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none placeholder-gray-400 text-gray-900 shadow-none"
              autoComplete="off"
              style={{ outline: 'none', boxShadow: 'none' }}
            />
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                onClick={() => onToggleFileUpload(!showFileUpload)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2 h-auto"
                title={t('conversation.attach_file')}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (isListening) {
                    onStopListening();
                  } else {
                    if (isSpeechSupported) {
                      onStartListening();
                    }
                  }
                }}
                disabled={!isSpeechSupported}
                variant={isListening ? "default" : "ghost"}
                size="sm"
                className={`rounded-full p-2 h-auto transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                } ${
                  !isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={isListening ? { boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)' } : {}}
                title={
                  isSpeechSupported
                    ? isListening
                      ? 'Stop listening'
                      : 'Start listening'
                    : 'Speech recognition not supported'
                }
              >
                <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
              </Button>
              <Button
                type="submit"
                disabled={isSending || (!inputValue.trim() && !attachedFile) || disabled}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full p-2.5 h-auto w-10 flex items-center justify-center transition-colors"
              >
                {isSending ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
