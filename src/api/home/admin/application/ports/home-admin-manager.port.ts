import { HomeBannerSnapshot, HomeFaqSnapshot } from '../../../application/ports/home-content-reader.port';
import type {
    HomeBannerCommand,
    HomeBannerUpdateCommand,
    HomeFaqCommand,
    HomeFaqUpdateCommand,
} from '../types/home-admin-command.type';

export const HOME_ADMIN_MANAGER = Symbol('HOME_ADMIN_MANAGER');

export interface HomeAdminManagerPort {
    readAllBanners(): Promise<HomeBannerSnapshot[]>;
    createBanner(data: HomeBannerCommand): Promise<HomeBannerSnapshot>;
    updateBanner(bannerId: string, data: HomeBannerUpdateCommand): Promise<HomeBannerSnapshot | null>;
    deleteBanner(bannerId: string): Promise<boolean>;

    readAllFaqs(): Promise<HomeFaqSnapshot[]>;
    createFaq(data: HomeFaqCommand): Promise<HomeFaqSnapshot>;
    updateFaq(faqId: string, data: HomeFaqUpdateCommand): Promise<HomeFaqSnapshot | null>;
    deleteFaq(faqId: string): Promise<boolean>;
}
