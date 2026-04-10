export type AdopterAccountDeleteCommand = {
    reason:
        | 'already_adopted'
        | 'no_suitable_pet'
        | 'adoption_fee_burden'
        | 'uncomfortable_ui'
        | 'privacy_concern'
        | 'other';
    otherReason?: string;
};
