import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { Language } from '@/types';

interface LanguageSelectorProps {
  minimal?: boolean;
}

const LanguageSelector = ({ minimal = false }: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; shortLabel: string }[] = [
    { code: 'en', label: 'English', shortLabel: 'EN' },
    { code: 'ja', label: '日本語', shortLabel: 'JP' },
    { code: 'zh', label: '中文', shortLabel: 'CN' },
    { code: 'ko', label: '한국어', shortLabel: 'KR' },
    { code: 'vi', label: 'Tiếng Việt', shortLabel: 'VN' }
  ];

  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const getCurrentLanguageLabel = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    return minimal ? currentLang?.shortLabel : currentLang?.label;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <span>{getCurrentLanguageLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" ref={dropdownRef}>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer ${i18n.language === lang.code ? 'bg-accent text-accent-foreground' : ''}`}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
