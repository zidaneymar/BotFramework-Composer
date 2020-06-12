// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ResolverResource, importResolverGenerator, LgTemplate, Diagnostic as LgDiagnostic } from '@bfc/shared';
import { Templates, Diagnostic } from 'botbuilder-lg';

function createDiagnostic(diagnostic: Diagnostic): LgDiagnostic {
  const { code, range, severity, source, message } = diagnostic;
  const { start, end } = range;
  return {
    code,
    range: {
      start: { line: start.line, character: start.character },
      end: { line: end.line, character: end.character },
    },
    severity,
    source,
    message,
  };
}

export class LgParser {
  public async parseText(
    content: string,
    id: string,
    resources: ResolverResource[]
  ): Promise<{ templates: LgTemplate[]; diagnostics: LgDiagnostic[] }> {
    return new Promise((resolve, reject) => {
      let templates: LgTemplate[] = [];
      let diagnostics: LgDiagnostic[] = [];
      try {
        const resolver = importResolverGenerator(resources, '.lg');
        const { allTemplates, allDiagnostics } = Templates.parseText(content, id, resolver);
        templates = allTemplates.map((item) => ({ name: item.name, parameters: item.parameters, body: item.body }));
        diagnostics = allDiagnostics.map((item) => createDiagnostic(item));
        resolve({ templates, diagnostics });
      } catch (error) {
        reject(error);
      }
    });
  }
}
