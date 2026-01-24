import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal';
}

export function LanguageSelector({ variant = 'default' }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const currentLanguage = getLanguageByCode(i18n.language);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Store in localStorage for persistence
    localStorage.setItem('i18nextLng', langCode);
  };

  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <span className="text-lg">{currentLanguage.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
              {i18n.language === lang.code && (
                <Check className="h-4 w-4 ml-auto text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
            {i18n.language === lang.code && (
              <Check className="h-4 w-4 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
