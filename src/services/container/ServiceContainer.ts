import { FirestoreAuditRepository } from '../../repositories/implementations/FirestoreAuditRepository';
import { InMemoryVersionRepository } from '../../repositories/implementations/InMemoryVersionRepository';
import { AuditService } from '../implementations/AuditService';
import { NotificationService } from '../implementations/NotificationService';
import { IAuditService } from '../interfaces/IAuditService';
import { INotificationService } from '../interfaces/INotificationService';
import { IVersionRepository } from '../../repositories/interfaces/IVersionRepository';

class ServiceContainer {
  private auditRepo = new FirestoreAuditRepository();
  private versionRepo = new InMemoryVersionRepository();


  private auditServiceInstance: IAuditService;
  private notificationServiceInstance: INotificationService;

  constructor() {
    // Inject Repository Dependencies into Services
    this.auditServiceInstance = new AuditService(this.auditRepo);
    this.notificationServiceInstance = new NotificationService();
  }

  public getAuditService(): IAuditService {
    return this.auditServiceInstance;
  }

  public getNotificationService(): INotificationService {
    return this.notificationServiceInstance;
  }

  public getVersionRepository(): IVersionRepository {
    return this.versionRepo;
  }
}

export const serviceContainer = new ServiceContainer();
