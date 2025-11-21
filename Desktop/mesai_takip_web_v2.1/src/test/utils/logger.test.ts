import { describe, it, expect, beforeEach, vi } from 'vitest'
import { logger, LogLevel } from '../../utils/logger'

describe('Logger', () => {
  beforeEach(() => {
    // Reset logger state before each test
    logger.clearLogs()
    logger.setLogLevel(LogLevel.DEBUG)
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should log debug messages in development', () => {
    logger.debug('Test debug message', { data: 'test' }, 'TestComponent')
    
    const logs = logger.getLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({
      level: LogLevel.DEBUG,
      message: 'Test debug message',
      data: { data: 'test' },
      source: 'TestComponent'
    })
  })

  it('should respect log levels', () => {
    logger.setLogLevel(LogLevel.WARN)
    
    logger.debug('Debug message')
    logger.info('Info message')
    logger.warn('Warning message')
    logger.error('Error message')
    
    const logs = logger.getLogs()
    expect(logs).toHaveLength(2) // Only WARN and ERROR
    expect(logs[0].level).toBe(LogLevel.WARN)
    expect(logs[1].level).toBe(LogLevel.ERROR)
  })

  it('should limit log history', () => {
    // Create a logger with small max logs for testing
    const testLogger = Object.create(logger)
    testLogger.maxLogs = 3
    
    for (let i = 0; i < 5; i++) {
      testLogger.info(`Message ${i}`)
    }
    
    const logs = testLogger.getLogs()
    expect(logs).toHaveLength(3)
    expect(logs[0].message).toBe('Message 2')
    expect(logs[2].message).toBe('Message 4')
  })

  it('should export logs as JSON', () => {
    logger.info('Test message', { test: true })
    
    const exported = logger.exportLogs()
    const parsed = JSON.parse(exported)
    
    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      level: LogLevel.INFO,
      message: 'Test message',
      data: { test: true }
    })
  })

  it('should clear logs', () => {
    logger.info('Test message 1')
    logger.info('Test message 2')
    
    expect(logger.getLogs()).toHaveLength(2)
    
    logger.clearLogs()
    
    expect(logger.getLogs()).toHaveLength(0)
  })

  it('should format timestamps correctly', () => {
    const before = new Date().toISOString()
    logger.info('Test message')
    const after = new Date().toISOString()
    
    const logs = logger.getLogs()
    const timestamp = logs[0].timestamp
    
    expect(typeof timestamp).toBe('string')
    expect(timestamp >= before).toBe(true)
    expect(timestamp <= after).toBe(true)
  })
})
