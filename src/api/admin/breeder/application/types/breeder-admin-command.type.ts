import { RemindType } from '../../constants/breeder-remind.enum';

export type BreederSuspendCommand = {
    reason: string;
};

export type BreederRemindCommand = {
    breederIds: string[];
    remindType: RemindType;
};
