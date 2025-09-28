import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'time';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

interface ResponsiveFormProps {
  title?: string;
  fields: FormField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitLoading?: boolean;
  onCancel?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const ResponsiveForm = ({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = "Enregistrer",
  submitLoading = false,
  onCancel,
  className,
  children
}: ResponsiveFormProps) => {
  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: values[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        onChange(field.name, e.target.value),
      placeholder: field.placeholder,
      disabled: field.disabled,
      required: field.required,
      className: cn("text-responsive", field.className)
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={3}
            className="text-responsive resize-none"
          />
        );
      
      case 'select':
        return (
          <Select 
            value={values[field.name] || ''} 
            onValueChange={(value) => onChange(field.name, value)}
            disabled={field.disabled}
          >
            <SelectTrigger className="text-responsive">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent className="z-50">
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
          />
        );
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-responsive-title">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-responsive">
          <div className="grid-responsive-2 gap-responsive">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label 
                  htmlFor={field.name}
                  className="text-responsive-small font-medium"
                >
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          
          {children}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={submitLoading}
              className="btn-responsive flex-1 touch-target"
            >
              {submitLoading ? "Enregistrement..." : submitLabel}
            </Button>
            {onCancel && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                className="btn-responsive sm:w-auto touch-target"
              >
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResponsiveForm;