import React from 'react';
import { cn } from '../../utils';

type SkeuoInputBaseProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'>;

interface SkeuoInputProps extends SkeuoInputBaseProps {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const SkeuoInput: React.FC<SkeuoInputProps> = ({
  label, error, hint, prefix, suffix, className, id, ...props
}) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="skeuo-label">
        {label}{props.required && <span className="text-skeuo-gold ml-1">*</span>}
      </label>
    )}
    <div className={cn(
      'flex items-center rounded-lg overflow-hidden border transition-all',
      'bg-gradient-to-b from-[#131619] to-[#1c2028] shadow-skeuo-inset',
      error ? 'border-red-500/60 focus-within:border-red-400' : 'border-white/08 focus-within:border-skeuo-gold/40',
    )}>
      {prefix && (
        <span className="flex items-center px-3 border-r border-white/08 text-gray-500 text-sm h-full bg-white/03">
          {prefix}
        </span>
      )}
      <input
        id={id}
        className={cn(
          'flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 outline-none',
          'autofill:bg-transparent',
          className
        )}
        {...props}
      />
      {suffix && (
        <span className="flex items-center px-3 border-l border-white/08 text-gray-500 text-sm h-full bg-white/03">
          {suffix}
        </span>
      )}
    </div>
    {error && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {error}</p>}
    {hint && !error && <p className="text-xs text-gray-600">{hint}</p>}
  </div>
);

interface SkeuoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const SkeuoTextarea: React.FC<SkeuoTextareaProps> = ({ label, error, className, id, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label htmlFor={id} className="skeuo-label">{label}</label>}
    <textarea
      id={id}
      className={cn(
        'rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 outline-none',
        'bg-gradient-to-b from-[#131619] to-[#1c2028] shadow-skeuo-inset',
        'border transition-all resize-none',
        error ? 'border-red-500/60' : 'border-white/08 focus:border-skeuo-gold/40',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-400">⚠ {error}</p>}
  </div>
);

interface SkeuoSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}
export const SkeuoSelect: React.FC<SkeuoSelectProps> = ({ label, error, options, className, id, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label htmlFor={id} className="skeuo-label">{label}</label>}
    <select
      id={id}
      className={cn(
        'rounded-lg px-3 py-2.5 text-sm text-gray-200 outline-none cursor-pointer appearance-none',
        'bg-gradient-to-b from-[#22262f] to-[#1c2028] shadow-skeuo-inset',
        'border transition-all',
        error ? 'border-red-500/60' : 'border-white/08 focus:border-skeuo-gold/40',
        className
      )}
      {...props}
    >
      {options.map(o => <option key={o.value} value={o.value} className="bg-[#22262f]">{o.label}</option>)}
    </select>
    {error && <p className="text-xs text-red-400">⚠ {error}</p>}
  </div>
);
