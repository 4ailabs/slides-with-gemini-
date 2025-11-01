import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import * as FiIcons from 'react-icons/fi';
import * as LuIcons from 'react-icons/lu';
import * as HiIcons from 'react-icons/hi';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';
import * as IoIcons from 'react-icons/io5';
import * as TbIcons from 'react-icons/tb';

interface IconPickerProps {
  onSelect: (iconName: string) => void;
  onClose: () => void;
  currentTheme: string;
}

// Categorías de iconos por librería
const iconCategories = [
  { name: 'Feather', prefix: 'Fi', icons: FiIcons },
  { name: 'Lucide', prefix: 'Lu', icons: LuIcons },
  { name: 'Heroicons', prefix: 'Hi', icons: HiIcons },
  { name: 'Ant Design', prefix: 'Ai', icons: AiIcons },
  { name: 'Boxicons', prefix: 'Bi', icons: BiIcons },
  { name: 'Bootstrap', prefix: 'Bs', icons: BsIcons },
  { name: 'Material Design', prefix: 'Md', icons: MdIcons },
  { name: 'Font Awesome', prefix: 'Fa', icons: FaIcons },
  { name: 'Ionicons', prefix: 'Io', icons: IoIcons },
  { name: 'Tabler', prefix: 'Tb', icons: TbIcons },
];

// Iconos populares por categoría
const popularIcons = [
  { name: 'FiStar', category: 'Feather' },
  { name: 'FiHeart', category: 'Feather' },
  { name: 'FiCheck', category: 'Feather' },
  { name: 'FiZap', category: 'Feather' },
  { name: 'FiTarget', category: 'Feather' },
  { name: 'LuRocket', category: 'Lucide' },
  { name: 'LuTrendingUp', category: 'Lucide' },
  { name: 'LuShield', category: 'Lucide' },
  { name: 'LuLightbulb', category: 'Lucide' },
  { name: 'HiSparkles', category: 'Heroicons' },
  { name: 'AiFillStar', category: 'Ant Design' },
  { name: 'BiTrophy', category: 'Boxicons' },
  { name: 'BsAward', category: 'Bootstrap' },
  { name: 'MdCheckCircle', category: 'Material Design' },
  { name: 'FaRocket', category: 'Font Awesome' },
  { name: 'IoFlame', category: 'Ionicons' },
  { name: 'TbFlame', category: 'Tabler' },
];

const IconPicker: React.FC<IconPickerProps> = ({ onSelect, onClose, currentTheme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getAllIcons = () => {
    const allIcons: Array<{ name: string; category: string; prefix: string; Icon: any }> = [];
    
    iconCategories.forEach(category => {
      Object.keys(category.icons).forEach(iconName => {
        if (iconName.startsWith(category.prefix)) {
          allIcons.push({
            name: iconName,
            category: category.name,
            prefix: category.prefix,
            Icon: (category.icons as any)[iconName],
          });
        }
      });
    });
    
    return allIcons;
  };

  const filteredIcons = () => {
    const allIcons = getAllIcons();
    
    if (!searchTerm && !selectedCategory) {
      // Mostrar iconos populares si no hay filtros
      return popularIcons.map(pop => {
        const category = iconCategories.find(c => c.name === pop.category);
        const IconComponent = category ? (category.icons as any)[pop.name] : null;
        return IconComponent ? {
          name: pop.name,
          category: pop.category,
          prefix: category.prefix,
          Icon: IconComponent,
        } : null;
      }).filter(Boolean);
    }
    
    return allIcons.filter(icon => {
      const matchesSearch = !searchTerm || 
        icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        icon.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || icon.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const handleIconClick = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  const getThemeColor = () => {
    const themeColors: Record<string, string> = {
      'purple-pink': '#a855f7',
      'blue-cyan': '#06b6d4',
      'green-emerald': '#10b981',
      'orange-red': '#f97316',
      'dark-minimal': '#ffffff',
    };
    return themeColors[currentTheme] || themeColors['purple-pink'];
  };

  const themeColor = getThemeColor();

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6" style={{ color: themeColor }} />
            Seleccionar Icono
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar iconos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las categorías</option>
              {iconCategories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-4">
            {filteredIcons().map(({ name, Icon }) => (
              <button
                key={name}
                onClick={() => handleIconClick(name)}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all hover:scale-110 flex items-center justify-center group"
                title={name}
                style={{ 
                  borderColor: themeColor,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = themeColor + '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ color: themeColor }}
                />
              </button>
            ))}
          </div>
          {filteredIcons().length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No se encontraron iconos con ese término de búsqueda.
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4">
          <p className="text-gray-400 text-sm text-center">
            Haz clic en un icono para seleccionarlo. Los iconos se adaptarán al tema de la presentación.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;

