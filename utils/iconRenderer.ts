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

const iconLibraries: Record<string, any> = {
  Fi: FiIcons,
  Lu: LuIcons,
  Hi: HiIcons,
  Ai: AiIcons,
  Bi: BiIcons,
  Bs: BsIcons,
  Md: MdIcons,
  Fa: FaIcons,
  Io: IoIcons,
  Tb: TbIcons,
};

export const getIconComponent = (iconName: string) => {
  const prefix = iconName.substring(0, 2);
  const library = iconLibraries[prefix];
  if (!library) return null;
  
  const IconComponent = library[iconName];
  return IconComponent || null;
};

