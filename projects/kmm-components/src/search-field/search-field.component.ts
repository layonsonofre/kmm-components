import {
   Component,
   OnInit,
   Input,
   Output,
   EventEmitter,
   ChangeDetectorRef,
   OnDestroy,
   ViewChild,
   ElementRef
} from '@angular/core';
import { PopoverService } from '../popover/popover.service';
import { SearchFieldListComponent } from '../search-field-list/search-field-list.component';
import { Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PopoverRef } from '../popover/popover-ref';
import { KmmSearchFieldConfig } from './search-field-config.interface';
import { Subscription } from 'rxjs';
import { isFunction } from 'util';

@Component({
   selector: 'kmm-search-field',
   templateUrl: './search-field.component.html',
   styleUrls: ['./search-field.component.scss']
})
export class SearchFieldComponent implements OnInit, OnDestroy {
   // configuration object input
   @Input('config') public searchConfig: Partial<KmmSearchFieldConfig>;

   // emitted events
   @Output('onSelect') private onSelectEmitter: EventEmitter<any>;

   @ViewChild('target', { static: true }) target: ElementRef<HTMLElement>;

   public data: Array<any>;
   private oldField: any;
   private oldDescription: any;
   public maxLengthValidated: number;
   public minLengthValidated: number;
   public inputPattern: RegExp;
   private popoverRef: PopoverRef;
   public loading: boolean;
   public callSubscription: Subscription;

   constructor(
      private popoverService: PopoverService,
      protected changeDetectorRef: ChangeDetectorRef
   ) {
      this.onSelectEmitter = new EventEmitter();
   }

   ngOnInit() {
      // set icon font
      if (typeof this.searchConfig.iconFontSet == 'undefined') {
         this.searchConfig.iconFontSet = 'material-icons-outlined';
      }

      // init main field control
      this.searchConfig.field.valueChanges
         .pipe(
            distinctUntilChanged(),
            debounceTime(300)
         )
         .subscribe(() => {
            this.handleTyping();
         });

      // set validators
      let validators = [];
      if (
         typeof this.searchConfig.maxLength != 'undefined' &&
         parseInt(this.searchConfig.maxLength) > 0
      ) {
         this.maxLengthValidated = parseInt(this.searchConfig.maxLength);
         validators.push(
            Validators.maxLength(parseInt(this.searchConfig.maxLength))
         );
      }
      if (
         typeof this.searchConfig.minLength != 'undefined' &&
         parseInt(this.searchConfig.minLength) > 0
      ) {
         this.minLengthValidated = parseInt(this.searchConfig.minLength);
         validators.push(
            Validators.minLength(parseInt(this.searchConfig.minLength))
         );
      }
      if (typeof this.searchConfig.pattern != 'undefined') {
         let pattern;
         if (this.searchConfig.pattern == 'numberAndText') {
            pattern =
               '^[a-zA-ZáéíóúÁÉÍÓÚçÇãõÃÕüÜâêîôûÂÊÎÔÛàèìòùÀÈÌÒÙ0-9.-_*\\s\']*$';
         } else if (this.searchConfig.pattern == 'number') {
            pattern = '^[0-9]*$';
         } else if (this.searchConfig.pattern == 'text') {
            pattern = '^[a-zA-ZáéíóúÁÉÍÓÚçÇãõÃÕüÜâêîôûÂÊÎÔÛàèìòùÀÈÌÒÙ.-_*\\s\']*$';
         }
         validators.push(Validators.pattern(pattern));
         this.inputPattern = new RegExp(pattern);
      }
      if (validators.length > 0) {
         this.searchConfig.field.setValidators(Validators.compose(validators));
      }
   }

   ngOnDestroy() {
      if (this.callSubscription && this.callSubscription.unsubscribe) {
         this.callSubscription.unsubscribe();
      }
   }

   handleResult() {
      this.oldField = this.searchConfig.field.value;
      this.oldDescription = this.oldDescription;

      if (this.data && this.data.length) {
         if (this.data.length == 1) {
            this.setSelectedItem(this.data[0]);
         } else {
            if (this.searchConfig.description) {
               this.searchConfig.description.setValue('');
            }
            this.showPopover();
         }
      } else if (
         !this.searchConfig.field.value ||
         this.searchConfig.field.value == ''
      ) {
         if (this.searchConfig.description) {
            this.searchConfig.description.setValue(null);
         }
         this.onSelectEmitter.emit(null);
      } else {
         if (this.searchConfig.description) {
            this.searchConfig.description.setValue('Registro não encontrado');
         }
         this.onSelectEmitter.emit(null);
      }
   }

   setSelectedItem(item: any): void {
      if (item != null) {
         if (
            this.searchConfig.field.value !== item[this.searchConfig.fieldName]
         ) {
            this.searchConfig.field.setValue(
               item[this.searchConfig.fieldName],
               {
                  emitEvent: false
               }
            );
            if (this.searchConfig.description) {
               this.searchConfig.description.setValue(
                  item[this.searchConfig.descriptionName]
               );
            }
         }
      } else {
         this.searchConfig.field.setValue(null, { emitEvent: false });
         if (this.searchConfig.description) {
            this.searchConfig.description.setValue(null);
         }
      }

      this.onSelectEmitter.emit(item);
      this.closePopover();
   }

   handleTyping() {
      this.closePopover();
      if (this.searchConfig.field.valid) {
         let value = this.searchConfig.field.value;

         if (
            parseInt(this.searchConfig.minLength) > 0 &&
            (!value || value.length == 0)
         ) {
            if (this.data) {
               this.data = null;
            }

            this.setSelectedItem(null);
         } else if (
            (this.oldField != value ||
               (this.oldField == value && !this.data)) &&
            (parseInt(this.searchConfig.minLength) == 0 ||
               (parseInt(this.searchConfig.minLength) > 0 &&
                  value &&
                  value.length >= parseInt(this.searchConfig.minLength)))
         ) {
            if (
               this.searchConfig.searchAction &&
               typeof this.searchConfig.searchAction.backendCall ==
                  'function' &&
               this.searchConfig.searchAction.operation
            ) {
               if (
                  this.loading &&
                  this.callSubscription &&
                  this.callSubscription.unsubscribe
               ) {
                  this.callSubscription.unsubscribe();
                  this.closePopover();
               }

               let params = {};
               params[
                  this.searchConfig.fieldName
               ] = this.searchConfig.field.value;

               this.loading = true;

               const callObject = {
                  module: this.searchConfig.searchAction.module
                     ? this.searchConfig.searchAction.module
                     : undefined,
                  operation: this.searchConfig.searchAction.operation,
                  parameters: params
               };

               let temp: any = this.searchConfig.searchAction.backendCall(
                  callObject
               );

               if (isFunction(temp.subscribe)) {
                  this.callSubscription = temp.subscribe(
                     this.handleSuccess,
                     this.handleFailure
                  );
               } else if (isFunction(temp.then)) {
                  this.callSubscription = temp
                     .then(this.handleSuccess)
                     .catch(this.handleFailure);
               } else {
                  console.error('No backend callback was defined.');
               }
            }
         } else if (this.oldField == value && this.data && this.data.length) {
            if (this.data.length == 1) {
               this.setSelectedItem(this.data[0]);
            } else {
               this.showPopover();
            }
         }
      }
   }

   handleSuccess = (res: any) => {
      if (res && res[this.searchConfig.searchAction.responseObject]) {
         this.data = res[this.searchConfig.searchAction.responseObject];
         this.handleResult();
      }
      this.loading = false;
   }

   handleFailure = (err: any) => {
      this.loading = false;
   }

   showPopover() {
      this.closePopover();

      setTimeout(() => {
         if (
            typeof this.searchConfig.searchAction != 'undefined' &&
            this.target &&
            this.target.nativeElement
         ) {
            this.popoverRef = this.popoverService.open(
               SearchFieldListComponent,
               this.target.nativeElement,
               {
                  data: {
                     items: this.data,
                     mainField: this.searchConfig.fieldName,
                     secondaryField: this.searchConfig.descriptionName
                  },
                  panelClass: 'popover-over-dialog',
                  backdropClass: 'invisible-backdrop'
               },
               this.searchConfig.preferredPositions
            );
         }
         if (this.popoverRef && this.popoverRef.afterClosed) {
            this.popoverRef.afterClosed().subscribe(res => {
               if (res != '-1') {
                  if (res) {
                     this.setSelectedItem(res);
                  } else {
                     this.searchConfig.field.setValue(this.oldField, {
                        emitEvent: false
                     });
                     if (this.searchConfig.description) {
                        this.searchConfig.description.setValue(
                           this.oldDescription
                        );
                     }
                  }
               }
            });
         }
      }, 150);
   }

   closePopover() {
      if (this.popoverRef) {
         this.popoverRef.close('-1');
      }
   }
}
