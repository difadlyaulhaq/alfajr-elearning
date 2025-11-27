import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ size?: number }>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  onClick,
  className = ''
}) => {
  
  const baseStyles = 'font-semibold rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2';
  
  const variants = {
    primary: 'bg-[#C5A059] text-black hover:bg-[#B08F4A] shadow-md hover:shadow-lg',
    secondary: 'bg-white border-2 border-[#C5A059] text-[#C5A059] hover:bg-[#FFF8E7]',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-md',
    ghost: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    dark: 'bg-black text-white hover:bg-gray-900 shadow-md',
    outline: 'bg-transparent border-2 border-black text-black hover:bg-black hover:text-white'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthStyles}
        ${disabled ? disabledStyles : ''}
        ${className}
      `}
    >
      {Icon && iconPosition === 'left' && <Icon size={20} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon size={20} />}
    </button>
  );
};

// Demo component showcasing all button variants
const ButtonShowcase: React.FC = () => {
  const handleClick = (variant: string) => {
    console.log(`${variant} button clicked!`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Button Component Library</h1>
          <p className="text-gray-600">Komponen button sesuai dengan brand guidelines Alfajr Umroh</p>
          <div className="mt-4 flex space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-[#C5A059] rounded"></div>
              <span className="text-sm text-gray-600">Golden Sand: #C5A059</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-black rounded"></div>
              <span className="text-sm text-gray-600">Kaaba Black: #000000</span>
            </div>
          </div>
        </div>

        {/* Primary Variants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-black mb-4">Primary Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small</p>
              <Button variant="primary" size="sm" onClick={() => handleClick('primary-sm')}>
                Small Button
              </Button>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Medium (Default)</p>
              <Button variant="primary" size="md" onClick={() => handleClick('primary-md')}>
                Medium Button
              </Button>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Large</p>
              <Button variant="primary" size="lg" onClick={() => handleClick('primary-lg')}>
                Large Button
              </Button>
            </div>
          </div>
        </div>

        {/* All Variants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-black mb-4">Button Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="primary" onClick={() => handleClick('primary')}>
              Primary Button
            </Button>
            <Button variant="secondary" onClick={() => handleClick('secondary')}>
              Secondary Button
            </Button>
            <Button variant="danger" onClick={() => handleClick('danger')}>
              Danger Button
            </Button>
            <Button variant="success" onClick={() => handleClick('success')}>
              Success Button
            </Button>
            <Button variant="ghost" onClick={() => handleClick('ghost')}>
              Ghost Button
            </Button>
            <Button variant="dark" onClick={() => handleClick('dark')}>
              Dark Button
            </Button>
            <Button variant="outline" onClick={() => handleClick('outline')}>
              Outline Button
            </Button>
            <Button variant="primary" disabled>
              Disabled Button
            </Button>
          </div>
        </div>

        {/* With Icons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-black mb-4">Buttons with Icons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="primary" 
              icon={() => <span>➕</span>}
              iconPosition="left"
              onClick={() => handleClick('icon-left')}
            >
              Tambah Data
            </Button>
            <Button 
              variant="secondary" 
              icon={() => <span>📥</span>}
              iconPosition="left"
              onClick={() => handleClick('download')}
            >
              Download Report
            </Button>
            <Button 
              variant="danger" 
              icon={() => <span>🗑️</span>}
              iconPosition="left"
              onClick={() => handleClick('delete')}
            >
              Hapus Data
            </Button>
            <Button 
              variant="success" 
              icon={() => <span>✓</span>}
              iconPosition="left"
              onClick={() => handleClick('save')}
            >
              Simpan Perubahan
            </Button>
          </div>
        </div>

        {/* Full Width */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-black mb-4">Full Width Buttons</h2>
          <div className="space-y-3">
            <Button variant="primary" fullWidth onClick={() => handleClick('full-primary')}>
              Primary Full Width
            </Button>
            <Button variant="secondary" fullWidth onClick={() => handleClick('full-secondary')}>
              Secondary Full Width
            </Button>
            <Button variant="outline" fullWidth onClick={() => handleClick('full-outline')}>
              Outline Full Width
            </Button>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-black text-white rounded-lg p-8 mt-6">
          <h2 className="text-xl font-bold mb-4 text-[#C5A059]">Usage Example</h2>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`import Button from '@/components/shared/Button';

// Basic usage
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// With icon
<Button 
  variant="primary" 
  icon={PlusIcon}
  iconPosition="left"
>
  Add New
</Button>

// Full width
<Button variant="primary" fullWidth>
  Submit Form
</Button>

// Disabled
<Button variant="primary" disabled>
  Disabled State
</Button>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ButtonShowcase;