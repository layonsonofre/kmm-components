import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PopoverActionsComponent } from "../popover-actions/popover-actions.component";

import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import { SearchFieldComponent } from '../search-field/search-field.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SearchFieldListComponent } from "../search-field-list/search-field-list.component";
import { CustomMaskDirective } from './custom-mask.directive';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatListModule,
      MatIconModule,
      MatButtonModule,
      MatInputModule
   ],
   exports: [
      PopoverActionsComponent,
      SearchFieldComponent,
      SearchFieldListComponent,
      CustomMaskDirective,
   ],
   declarations: [
      PopoverActionsComponent,
      SearchFieldComponent,
      SearchFieldListComponent,
      CustomMaskDirective,
   ],
   entryComponents: [PopoverActionsComponent, SearchFieldListComponent]
})
export class KmmComponentsModule {}
