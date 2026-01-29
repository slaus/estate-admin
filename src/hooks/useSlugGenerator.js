import { useState, useCallback } from "react";

const transliterate = (text) => {
  const cyrillicMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'ґ': 'g', 'д': 'd',
    'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'i', 'і': 'i',
    'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ь': '', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Ґ': 'G', 'Д': 'D',
    'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'І': 'I',
    'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
    'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
  };

  return text.split('').map(char => cyrillicMap[char] || char).join('');
};

export const generateSlug = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let slug = transliterate(text);
  
  slug = slug.toLowerCase();
  
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  
  if (!slug) {
    const timestamp = Date.now().toString(36);
    slug = `page-${timestamp}`;
  }
  
  if (slug.length > 100) {
    slug = slug.substring(0, 100);
    slug = slug.replace(/-+$/, '');
  }
  
  return slug;
};

export const useSlugGenerator = (initialText = '') => {
  const [text, setText] = useState(initialText);
  const [slug, setSlug] = useState(generateSlug(initialText));
  const [isAutoGenerate, setIsAutoGenerate] = useState(true);

  const updateText = useCallback((newText) => {
    setText(newText);
    if (isAutoGenerate) {
      setSlug(generateSlug(newText));
    }
  }, [isAutoGenerate]);

  const updateSlug = useCallback((newSlug) => {
    setSlug(newSlug);
    setIsAutoGenerate(false);
  }, []);

  const regenerateSlug = useCallback(() => {
    const newSlug = generateSlug(text);
    setSlug(newSlug);
    setIsAutoGenerate(true);
    return newSlug;
  }, [text]);

  const toggleAutoGenerate = useCallback((enabled) => {
    setIsAutoGenerate(enabled);
    if (enabled) {
      setSlug(generateSlug(text));
    }
  }, [text]);

  return {
    text,
    slug,
    isAutoGenerate,
    updateText,
    updateSlug,
    regenerateSlug,
    toggleAutoGenerate,
    generateSlug: regenerateSlug
  };
};

export const validateSlug = (slug) => {
  if (!slug) return { valid: false, message: 'Slug не може бути порожнім' };
  
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return { 
      valid: false, 
      message: 'Slug може містити тільки латинські літери в нижньому регістрі, цифри та дефіси' 
    };
  }
  
  if (slug.length > 100) {
    return { valid: false, message: 'Slug не може бути довше 100 символів' };
  }
  
  return { valid: true, message: '' };
};