import { FormControl } from '@angular/forms';

export interface KmmSearchFieldConfig {
   // data properties
   icon: string;
   iconFontSet: string;
   idField: any;
   field: FormControl;
   fieldName: string;
   fieldLabel: string;
   description: FormControl;
   descriptionName: string;
   descriptionLabel: string;

   // config properties
   minLength: any;
   maxLength: any;
   pattern: string;

   // action properties
   searchAction: any;
}
