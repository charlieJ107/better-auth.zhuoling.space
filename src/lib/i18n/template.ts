/**
 * i18n template replacement system
 * Supports {{variable}} syntax with escape characters \ and \\
 */

import { getBrandingConfig } from '@/lib/branding';

export interface TemplateVariables {
  [key: string]: string | number | boolean;
}

/**
 * Replace template variables in a string
 * Template syntax: {{variableName}}
 * Escape characters: \{{ to output {{, \\ to output \
 * 
 * @param template - The template string
 * @param variables - Variables to replace
 * @returns The replaced string
 */
export function replaceTemplate(
  template: string,
  variables: TemplateVariables = {}
): string {
  const branding = getBrandingConfig();
  
  // Merge branding config into variables
  const allVariables: TemplateVariables = {
    appName: branding.appName,
    platformName: branding.platformName,
    serviceName: branding.serviceName,
    companyName: branding.companyName,
    ...variables,
  };
  
  let result = '';
  let i = 0;
  
  while (i < template.length) {
    // Check for escape sequence
    if (template[i] === '\\') {
      if (i + 1 < template.length) {
        const nextChar = template[i + 1];
        if (nextChar === '\\') {
          // Escaped backslash: \\
          result += '\\';
          i += 2;
          continue;
        } else if (nextChar === '{' && i + 2 < template.length && template[i + 2] === '{') {
          // Escaped opening brace: \{{
          result += '{{';
          i += 3;
          continue;
        } else if (nextChar === '}' && i + 2 < template.length && template[i + 2] === '}') {
          // Escaped closing brace: \}}
          result += '}}';
          i += 3;
          continue;
        }
      }
      // If not a recognized escape sequence, treat as literal backslash
      result += '\\';
      i++;
      continue;
    }
    
    // Check for template variable: {{variableName}}
    if (template[i] === '{' && i + 1 < template.length && template[i + 1] === '{') {
      // Find the closing }}
      let j = i + 2;
      let variableName = '';
      
      while (j < template.length) {
        if (template[j] === '}' && j + 1 < template.length && template[j + 1] === '}') {
          // Found closing }}
          const varValue = allVariables[variableName.trim()];
          if (varValue !== undefined) {
            result += String(varValue);
          } else {
            // Variable not found, keep the original template
            result += `{{${variableName}}}`;
          }
          i = j + 2;
          break;
        } else if (template[j] === '\\') {
          // Handle escape sequences within variable name (shouldn't happen, but handle gracefully)
          if (j + 1 < template.length) {
            variableName += template[j + 1];
            j += 2;
          } else {
            variableName += template[j];
            j++;
          }
        } else {
          variableName += template[j];
          j++;
        }
      }
      
      // If we didn't find closing }}, treat as literal text
      if (j >= template.length) {
        result += template[i];
        i++;
      }
    } else {
      result += template[i];
      i++;
    }
  }
  
  return result;
}

/**
 * Replace template variables in an object recursively
 */
export function replaceTemplateInObject<T>(obj: T, variables?: TemplateVariables): T {
  if (typeof obj === 'string') {
    return replaceTemplate(obj, variables) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => replaceTemplateInObject(item, variables)) as T;
  }
  
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceTemplateInObject(value, variables);
    }
    return result as T;
  }
  
  return obj;
}

