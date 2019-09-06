import {
   Directive,
   ElementRef,
   Input,
   OnInit,
   OnDestroy,
   Renderer2
} from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { SubscriptionLike } from "rxjs";

@Directive({
   selector: "[customMask]"
})
export class CustomMaskDirective implements OnInit, OnDestroy {
   private _customControl: AbstractControl;
   private _preValue: string;
   private _mask: RegExp;
   private _id: string;
   private _replacer: string;

   @Input()
   set customControl(control: AbstractControl) {
      this._customControl = control;
   }
   @Input()
   set preValue(value: string) {
      this._preValue = value || "";
   }
   @Input()
   set customMask(mask: string | RegExp) {
      this._mask = new RegExp(mask);
   }

   @Input()
   set id(id: string) {
      this._id = id;
   }

   @Input()
   set replacer(replacer: string) {
      this._replacer = replacer;
   }

   private sub: SubscriptionLike;

   constructor(private el: ElementRef, private renderer: Renderer2) {}

   ngOnInit() {
      this.customValidate();
   }

   ngOnDestroy() {
      this.sub.unsubscribe();
   }

   customValidate() {
      this.sub = this._customControl.valueChanges.subscribe(data => {
         /**we remove from input but:
         @preInputValue still keep the previous value because of not setting.
      */
         let preInputValue: string = this._preValue;
         var lastChar: string = preInputValue.substr(preInputValue.length - 1);
         // remove all mask characters (keep only numeric)
         var newVal = data.replace(/\D/g, "");

         let start = this.renderer.selectRootElement("#" + this._id).selectionStart;
         let end = this.renderer.selectRootElement("#" + this._id).selectionEnd;

         //when removed value from input
         if (data.length < preInputValue.length) {
            /**while removing if we encounter ) character,
        then remove the last digit too.*/
            if (preInputValue.length < start) {
               if (
                  lastChar == ")" ||
                  lastChar == "/" ||
                  lastChar == "-" ||
                  lastChar == " " ||
                  lastChar == ":"
               ) {
                  newVal = newVal.substr(0, newVal.length - 1);
               }
            }

            newVal = this.applyRegex(newVal);

            this._customControl.setValue(newVal, { emitEvent: false });
            //keep cursor the normal position after setting the input above.
            this.renderer
               .selectRootElement("#" + this._id)
               .setSelectionRange(start, end);
            //when typed value in input
         } else {
            var removedD = data.charAt(start);

            newVal = this.applyRegex(newVal);

            //check typing whether in middle or not
            //in the following case, you are typing in the middle
            if (preInputValue.length >= start) {
               //change cursor according to special chars.
               if (removedD == "(") {
                  start = start + 1;
                  end = end + 1;
               }
               if (removedD == ")") {
                  start = start + 2; // +2 so there is also space char after ')'.
                  end = end + 2;
               }
               if (removedD == "/") {
                  start = start + 1;
                  end = end + 1;
               }
               if (removedD == "-") {
                  start = start + 1;
                  end = end + 1;
               }
               if (removedD == ":") {
                  start = start + 1;
                  end = end + 1;
               }
               if (removedD == " ") {
                  start = start + 1;
                  end = end + 1;
               }
               this._customControl.setValue(newVal, { emitEvent: false });
               this.renderer
                  .selectRootElement("#" + this._id)
                  .setSelectionRange(start, end);
            } else {
               this._customControl.setValue(newVal, { emitEvent: false });
               this.renderer
                  .selectRootElement("#" + this._id)
                  .setSelectionRange(start + 2, end + 2); // +2 because of wanting standard typing
            }
         }
      });
   }

   applyRegex(newVal: string) {
      if (newVal.length == 0) {
         return "";
      }

      newVal = newVal.replace(this._mask, this._replacer);

      return newVal;
   }
}
