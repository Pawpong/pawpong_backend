export interface DistrictSnapshot {
    id: string;
    city: string;
    districts: string[];
    createdAt: Date;
    updatedAt: Date;
}

export const DISTRICT_ADMIN_READER_PORT = Symbol('DISTRICT_ADMIN_READER_PORT');

export interface DistrictAdminReaderPort {
    readAll(): Promise<DistrictSnapshot[]>;
    findById(id: string): Promise<DistrictSnapshot | null>;
    findByCity(city: string, excludeId?: string): Promise<DistrictSnapshot | null>;
}
