import { FormControl } from '@angular/forms';

export interface KmmSearchFieldConfig {
   // data properties
   icon: string;
   iconFontSet: string;
   idField: any;
   field: FormControl;
   fieldName: string;
   fieldLabel: string;
   fieldPlaceholder: string;
   description: FormControl;
   descriptionName: string;
   descriptionLabel: string;
   descriptionPlaceholder: string;

   // config properties
   minLength: any;
   maxLength: any;
   pattern: string;

   // action properties
   searchAction: any;

   // ui properties
   preferredPositions?: Array<string>
}
