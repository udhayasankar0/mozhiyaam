
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Book, BookOpen, Bold, Italic, Underline, Type, ChevronDown, Save, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Editor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'poem' | 'story' | 'opinion'>('poem');
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [selectedFont, setSelectedFont] = useState('default');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track word count
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [content]);

  // Apply formatting to selected text
  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (start === end) {
      toast({
        title: "எதுவும் தேர்ந்தெடுக்கவில்லை",
        description: "வடிவூட்டலுக்கு முன் உரையைத் தேர்ந்தெடுக்கவும்.",
        variant: "destructive",
      });
      return;
    }

    let formattedText = '';
    let newCursorPosition = end;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPosition = end + 4;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPosition = end + 2;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        newCursorPosition = end + 4;
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Restore focus and selection after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);

    toast({
      title: "வடிவூட்டல் பயன்படுத்தப்பட்டது",
      description: `${format} வடிவூட்டல் பயன்படுத்தப்பட்டது.`,
    });
  };

  // Apply font style to selected text
  const applyFont = (fontName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (start === end) {
      setSelectedFont(fontName);
      toast({
        title: "எழுத்துரு மாற்றப்பட்டது",
        description: "அடுத்து நீங்கள் உள்ளிடும் உரைக்கு எழுத்துரு பயன்படுத்தப்படும்.",
      });
      return;
    }

    const fontTag = `<span class="font-${fontName}">${selectedText}</span>`;
    const newContent = content.substring(0, start) + fontTag + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + fontTag.length, start + fontTag.length);
    }, 0);

    toast({
      title: "எழுத்துரு பயன்படுத்தப்பட்டது",
      description: "தேர்ந்தெடுக்கப்பட்ட உரைக்கு எழுத்துரு மாற்றப்பட்டது.",
    });
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "உள்நுழைய வேண்டும்",
        description: "பதிவிட உள்நுழைய வேண்டும்.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "தலைப்பு தேவை",
        description: "உங்கள் படைப்புக்கு ஒரு தலைப்பைக் கொடுங்கள்.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "உள்ளடக்கம் தேவை",
        description: "உங்கள் படைப்பை உள்ளிடவும்.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Create a new post in Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: title,
          content: content,
          type: contentType,
          user_id: user.id
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      console.log('Post created successfully:', data);
      
      setIsSaving(false);
      setLastSaved(new Date());
      toast({
        title: "வெற்றிகரமாக சேமிக்கப்பட்டது!",
        description: "உங்கள் படைப்பு வெளியிடப்பட்டது.",
      });

      // Navigate to the home page after successful posting
      // Using a different key to trigger a refresh
      navigate('/', { replace: true, state: { refresh: true } });
    } catch (error) {
      console.error('Error creating post:', error);
      setIsSaving(false);
      toast({
        title: "பிழை ஏற்பட்டது",
        description: "உங்கள் படைப்பை சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        variant: "destructive",
      });
    }
  };

  const renderPreview = () => {
    // Replace markdown-style formatting with HTML
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/<span class="font-(.*?)">(.*?)<\/span>/g, '<span class="font-$1">$2</span>');
    
    return { __html: formattedContent };
  };

  return (
    <MainLayout>
      <div className="container mx-auto pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 tamil">புதிய படைப்பு</h1>
            <p className="text-gray-600">
              உங்கள் எண்ணங்களை, கவிதைகளை அல்லது கதைகளை பகிரலாம்.
            </p>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        {contentType === 'poem' ? (
                          <>
                            <Book size={16} className="text-blue-500" />
                            <span className="tamil">கவிதை</span>
                          </>
                        ) : contentType === 'story' ? (
                          <>
                            <BookOpen size={16} className="text-emerald-500" />
                            <span className="tamil">சிறுகதை</span>
                          </>
                        ) : (
                          <>
                            <Type size={16} className="text-amber-500" />
                            <span className="tamil">கருத்து</span>
                          </>
                        )}
                        <ChevronDown size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setContentType('poem')}>
                        <div className="flex items-center gap-2">
                          <Book size={16} className="text-blue-500" />
                          <span className="tamil">கவிதை</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setContentType('story')}>
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-emerald-500" />
                          <span className="tamil">சிறுகதை</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setContentType('opinion')}>
                        <div className="flex items-center gap-2">
                          <Type size={16} className="text-amber-500" />
                          <span className="tamil">கருத்து</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <div className="text-xs text-muted-foreground">
                    <span>{wordCount}</span> சொற்கள்
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => formatText('bold')}
                    title="Bold"
                    className="hover:bg-blue-50"
                  >
                    <Bold size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => formatText('italic')}
                    title="Italic"
                    className="hover:bg-blue-50"
                  >
                    <Italic size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => formatText('underline')}
                    title="Underline"
                    className="hover:bg-blue-50"
                  >
                    <Underline size={16} />
                  </Button>
                  
                  <Select value={selectedFont} onValueChange={applyFont}>
                    <SelectTrigger className="w-[120px] h-9">
                      <Type size={16} className="mr-2" />
                      <SelectValue placeholder="எழுத்துரு" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">இயல்பு</SelectItem>
                      <SelectItem value="tamil">தமிழ்</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="mono">Mono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <Input
                  placeholder="தலைப்பு இங்கே உள்ளிடவும்"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium border-none shadow-none focus-visible:ring-0 px-0 tamil"
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <Textarea
                  ref={textareaRef}
                  placeholder="உங்கள் எண்ணங்களை இங்கே பகிரவும்..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] border-none shadow-none focus-visible:ring-0 px-0 resize-none tamil"
                />
                
                {content && (
                  <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="text-sm font-medium mb-2">முன்னோட்டம்:</h3>
                    <div 
                      className="prose max-w-none tamil"
                      dangerouslySetInnerHTML={renderPreview()} 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {lastSaved && (
                  <span>கடைசியாக சேமிக்கப்பட்டது: {lastSaved.toLocaleTimeString()}</span>
                )}
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Save size={16} />
                )}
                <span className="tamil">பதிவிடுக</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-md flex gap-2">
            <AlertCircle size={16} className="text-amber-500 mt-0.5" />
            <div className="text-sm text-amber-800">
              <span className="font-medium">குறிப்பு:</span> வடிவூட்டலுக்கு, மாற்ற விரும்பும் உரையைத் தேர்ந்தெடுத்து, மேலே உள்ள வடிவூட்டல் பொத்தான்களைப் பயன்படுத்தவும்.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Editor;
