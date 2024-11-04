export enum Language {
  Java = 'Java',
  CSharp = 'C#',
  JavaScript = 'JavaScript',
  TypeScript = 'TypeScript',
  Python = 'Python',
  Kotlin = 'Kotlin',
  C = 'C',
  CPlusPlus = 'C++',
  VisualBasic = 'Visual Basic',
  Html = 'HTML',
  ObjectiveC = 'Objective-C',
  Swift = 'Swift',
  Perl = 'Perl',
  Ruby = 'Ruby',
  Go = 'Go',
  Rust = 'Rust',
  Clojure = 'Clojure',
  Php = 'PHP',
  Scala = 'Scala',
  Hcl = 'Terraform',
  CiCd = 'CiCd',
  Gosu = 'Gosu',
  Groovy = 'Groovy',
  GoMod = 'GoMod',
  Fortran = 'Fortran',
}

export function humanizeLanguage(value: keyof typeof Language): string {
  switch (value) {
    case 'CSharp':
      return 'C#';
    case 'CPlusPlus':
      return 'C++';
    case 'VisualBasic':
      return 'Visual Basic';
    case 'Html':
      return 'HTML';
    case 'ObjectiveC':
      return 'Objective-C';
    case 'Php':
      return 'PHP';
    case 'Hcl':
      return 'Terraform';
    default:
      return value;
  }
}
