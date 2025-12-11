import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation('common');

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language || 'en';
    const languageNames: Record<string, string> = {
        en: t('language.english'),
        de: t('language.german'),
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Languages className="w-4 h-4" />
                    <span className="hidden sm:inline">{languageNames[currentLanguage]}</span>
                    <span className="sm:hidden">{currentLanguage.toUpperCase()}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => changeLanguage('en')}
                    className={currentLanguage === 'en' ? 'bg-accent' : ''}
                >
                    <span className="mr-2">🇬🇧</span>
                    {t('language.english')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => changeLanguage('de')}
                    className={currentLanguage === 'de' ? 'bg-accent' : ''}
                >
                    <span className="mr-2">🇩🇪</span>
                    {t('language.german')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
